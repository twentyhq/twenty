#!/bin/bash
set -euo pipefail

# Create Subscription Period and Change Request objects
# Idempotent: skips objects/fields that already exist

API_URL="${TWENTY_API_URL:-https://crm.tob.sh}"
API_KEY="${TWENTY_API_KEY:?Set TWENTY_API_KEY before running this script}"
CF_CLIENT_ID="${CF_ACCESS_CLIENT_ID:-}"
CF_CLIENT_SECRET="${CF_ACCESS_CLIENT_SECRET:-}"

gql() {
  local cf_headers=()
  if [ -n "$CF_CLIENT_ID" ] && [ -n "$CF_CLIENT_SECRET" ]; then
    cf_headers=(-H "CF-Access-Client-Id: $CF_CLIENT_ID" -H "CF-Access-Client-Secret: $CF_CLIENT_SECRET")
  fi
  curl -s -X POST "$API_URL/metadata" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    "${cf_headers[@]}" \
    -d "$1"
}

get_object_id() {
  gql "{\"query\": \"{ objects(paging: {first: 100}) { edges { node { id nameSingular } } } }\"}" \
    | jq -r ".data.objects.edges[].node | select(.nameSingular == \"$1\") | .id"
}

echo "=== Create Subscription Period Objects ==="

# --- Find workspaceMember object (needed for requestedBy/processedBy relations) ---
WM_ID=$(get_object_id "workspaceMember")
if [ -z "$WM_ID" ]; then
  echo "ERROR: workspaceMember object not found"
  exit 1
fi
echo "workspaceMember ID: $WM_ID"

# --- subscriptionPeriodChangeRequest (create first so we can reference it from Period) ---
echo ""
echo "--- Subscription Period Change Request ---"
CR_ID=$(get_object_id "subscriptionPeriodChangeRequest")
if [ -n "$CR_ID" ]; then
  echo "Already exists: $CR_ID"
else
  echo "Creating..."
  CR_ID=$(gql '{"query": "mutation { createOneObject(input: { object: { nameSingular: \"subscriptionPeriodChangeRequest\", namePlural: \"subscriptionPeriodChangeRequests\", labelSingular: \"Change Request\", labelPlural: \"Change Requests\", icon: \"IconGitPullRequest\", description: \"Approval workflow for subscription period changes\" } }) { id } }"}' \
    | jq -r '.data.createOneObject.id')
  echo "Created: $CR_ID"
fi

# Change Request fields
for field_json in \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"periodType\", label: \"Period Type\", type: SELECT, icon: \"IconCategory\", options: [{value: \"ACTIVE\", label: \"Active\", color: \"green\", position: 0}, {value: \"PAUSE\", label: \"Pause\", color: \"yellow\", position: 1}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"startDate\", label: \"Start Date\", type: DATE_TIME, icon: \"IconCalendar\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"duration\", label: \"Duration (Days)\", type: NUMBER, icon: \"IconClock\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"reason\", label: \"Reason\", type: TEXT, icon: \"IconFileText\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"notes\", label: \"Notes\", type: TEXT, icon: \"IconNotes\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"requestStatus\", label: \"Status\", type: SELECT, icon: \"IconCircleCheck\", options: [{value: \"PENDING\", label: \"Pending\", color: \"yellow\", position: 0}, {value: \"APPROVED\", label: \"Approved\", color: \"green\", position: 1}, {value: \"REJECTED\", label: \"Rejected\", color: \"red\", position: 2}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"proofReference\", label: \"Proof Reference\", type: TEXT, icon: \"IconLink\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"processedAt\", label: \"Processed At\", type: DATE_TIME, icon: \"IconClock\" } }) { id name } }"}' \
; do
  result=$(gql "$field_json")
  name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
  if [ -n "$name" ]; then
    echo "  Field '$name' created"
  else
    err=$(echo "$result" | jq -r '.errors[0].message // empty')
    echo "  Skipped (${err:-already exists or error})"
  fi
done

# Change Request -> workspaceMember relations (requestedBy, processedBy)
echo "Creating: Change Request requestedBy -> workspaceMember..."
result=$(gql '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"requestedBy\", label: \"Requested By\", type: RELATION, icon: \"IconUser\", relationCreationPayload: { type: MANY_TO_ONE, targetObjectMetadataId: \"'"$WM_ID"'\", targetFieldLabel: \"Change Requests (Requested)\", targetFieldIcon: \"IconGitPullRequest\" } } }) { id name } }"}')
name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
if [ -n "$name" ]; then
  echo "  Relation '$name' created"
else
  err=$(echo "$result" | jq -r '.errors[0].message // empty')
  echo "  Skipped (${err:-already exists or error})"
fi

echo "Creating: Change Request processedBy -> workspaceMember..."
result=$(gql '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"processedBy\", label: \"Processed By\", type: RELATION, icon: \"IconUserCheck\", relationCreationPayload: { type: MANY_TO_ONE, targetObjectMetadataId: \"'"$WM_ID"'\", targetFieldLabel: \"Change Requests (Processed)\", targetFieldIcon: \"IconGitPullRequest\" } } }) { id name } }"}')
name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
if [ -n "$name" ]; then
  echo "  Relation '$name' created"
else
  err=$(echo "$result" | jq -r '.errors[0].message // empty')
  echo "  Skipped (${err:-already exists or error})"
fi

# --- subscriptionPeriod ---
echo ""
echo "--- Subscription Period ---"
SP_ID=$(get_object_id "subscriptionPeriod")
if [ -n "$SP_ID" ]; then
  echo "Already exists: $SP_ID"
else
  echo "Creating..."
  SP_ID=$(gql '{"query": "mutation { createOneObject(input: { object: { nameSingular: \"subscriptionPeriod\", namePlural: \"subscriptionPeriods\", labelSingular: \"Subscription Period\", labelPlural: \"Subscription Periods\", icon: \"IconCalendarEvent\", description: \"A continuous time segment within a subscription\" } }) { id } }"}' \
    | jq -r '.data.createOneObject.id')
  echo "Created: $SP_ID"
fi

# Period fields
for field_json in \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SP_ID"'\", name: \"periodType\", label: \"Period Type\", type: SELECT, icon: \"IconCategory\", options: [{value: \"ACTIVE\", label: \"Active\", color: \"green\", position: 0}, {value: \"PAUSE\", label: \"Pause\", color: \"yellow\", position: 1}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SP_ID"'\", name: \"startDate\", label: \"Start Date\", type: DATE_TIME, icon: \"IconCalendar\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SP_ID"'\", name: \"endDate\", label: \"End Date\", type: DATE_TIME, icon: \"IconCalendarCheck\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SP_ID"'\", name: \"source\", label: \"Source\", type: SELECT, icon: \"IconSource\", options: [{value: \"CONTRACT\", label: \"Contract\", color: \"blue\", position: 0}, {value: \"CHANGE_REQUEST\", label: \"Change Request\", color: \"purple\", position: 1}, {value: \"MANUAL\", label: \"Manual\", color: \"gray\", position: 2}] } }) { id name } }"}' \
; do
  result=$(gql "$field_json")
  name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
  if [ -n "$name" ]; then
    echo "  Field '$name' created"
  else
    err=$(echo "$result" | jq -r '.errors[0].message // empty')
    echo "  Skipped (${err:-already exists or error})"
  fi
done

# --- Relations ---
echo ""
echo "--- Relations ---"

# Subscription -> Periods (one-to-many)
SUB_ID=$(get_object_id "tobSubscription")
if [ -z "$SUB_ID" ]; then
  echo "ERROR: tobSubscription not found"
  exit 1
fi
echo "tobSubscription ID: $SUB_ID"

echo "Creating: tobSubscription -> subscriptionPeriods..."
result=$(gql '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"subscriptionPeriods\", label: \"Subscription Periods\", type: RELATION, icon: \"IconCalendarEvent\", relationCreationPayload: { type: ONE_TO_MANY, targetObjectMetadataId: \"'"$SP_ID"'\", targetFieldLabel: \"Subscription\", targetFieldIcon: \"IconLink\" } } }) { id name } }"}')
name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
if [ -n "$name" ]; then
  echo "  Relation '$name' created"
else
  err=$(echo "$result" | jq -r '.errors[0].message // empty')
  echo "  Skipped (${err:-already exists or error})"
fi

# Subscription -> Change Requests (one-to-many)
echo "Creating: tobSubscription -> changeRequests..."
result=$(gql '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"changeRequests\", label: \"Change Requests\", type: RELATION, icon: \"IconGitPullRequest\", relationCreationPayload: { type: ONE_TO_MANY, targetObjectMetadataId: \"'"$CR_ID"'\", targetFieldLabel: \"Subscription\", targetFieldIcon: \"IconLink\" } } }) { id name } }"}')
name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
if [ -n "$name" ]; then
  echo "  Relation '$name' created"
else
  err=$(echo "$result" | jq -r '.errors[0].message // empty')
  echo "  Skipped (${err:-already exists or error})"
fi

# Change Request -> Period (one-to-many: one CR can create multiple periods)
echo "Creating: subscriptionPeriodChangeRequest -> subscriptionPeriods..."
result=$(gql '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CR_ID"'\", name: \"subscriptionPeriods\", label: \"Created Periods\", type: RELATION, icon: \"IconCalendarEvent\", relationCreationPayload: { type: ONE_TO_MANY, targetObjectMetadataId: \"'"$SP_ID"'\", targetFieldLabel: \"Change Request\", targetFieldIcon: \"IconGitPullRequest\" } } }) { id name } }"}')
name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
if [ -n "$name" ]; then
  echo "  Relation '$name' created"
else
  err=$(echo "$result" | jq -r '.errors[0].message // empty')
  echo "  Skipped (${err:-already exists or error})"
fi

echo ""
echo "=== Done ==="
echo "Check Settings > Data Model to verify the new objects."
