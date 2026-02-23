#!/bin/bash
set -euo pipefail

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

echo "=== Twenty Data Model Setup ==="

# 1. CommunicationLog
echo ""
echo "--- CommunicationLog ---"
CL_ID=$(get_object_id "communicationLog")
if [ -n "$CL_ID" ]; then
  echo "Already exists: $CL_ID"
else
  echo "Creating..."
  CL_ID=$(gql '{"query": "mutation { createOneObject(input: { object: { nameSingular: \"communicationLog\", namePlural: \"communicationLogs\", labelSingular: \"Communication Log\", labelPlural: \"Communication Logs\", icon: \"IconMessage\", description: \"Tracks all communication events across channels\" } }) { id } }"}' \
    | jq -r '.data.createOneObject.id')
  echo "Created: $CL_ID"
fi

for field_json in \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CL_ID"'\", name: \"channel\", label: \"Channel\", type: SELECT, icon: \"IconBroadcast\", options: [{value: \"CALL\", label: \"Call\", color: \"blue\", position: 0}, {value: \"SMS\", label: \"SMS\", color: \"green\", position: 1}, {value: \"WHATSAPP\", label: \"WhatsApp\", color: \"turquoise\", position: 2}, {value: \"EMAIL\", label: \"Email\", color: \"orange\", position: 3}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CL_ID"'\", name: \"direction\", label: \"Direction\", type: SELECT, icon: \"IconArrowsLeftRight\", options: [{value: \"INBOUND\", label: \"Inbound\", color: \"blue\", position: 0}, {value: \"OUTBOUND\", label: \"Outbound\", color: \"purple\", position: 1}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CL_ID"'\", name: \"status\", label: \"Status\", type: SELECT, icon: \"IconCircleCheck\", options: [{value: \"QUEUED\", label: \"Queued\", color: \"gray\", position: 0}, {value: \"SENT\", label: \"Sent\", color: \"blue\", position: 1}, {value: \"DELIVERED\", label: \"Delivered\", color: \"green\", position: 2}, {value: \"READ\", label: \"Read\", color: \"turquoise\", position: 3}, {value: \"FAILED\", label: \"Failed\", color: \"red\", position: 4}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CL_ID"'\", name: \"externalId\", label: \"External ID\", type: TEXT, icon: \"IconHash\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CL_ID"'\", name: \"contentSummary\", label: \"Content Summary\", type: TEXT, icon: \"IconFileText\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$CL_ID"'\", name: \"sentimentScore\", label: \"Sentiment Score\", type: NUMBER, icon: \"IconMoodSmile\" } }) { id name } }"}' \
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

# 2. AI Profile
echo ""
echo "--- AI Profile ---"
AP_ID=$(get_object_id "aiProfile")
if [ -n "$AP_ID" ]; then
  echo "Already exists: $AP_ID"
else
  echo "Creating..."
  AP_ID=$(gql '{"query": "mutation { createOneObject(input: { object: { nameSingular: \"aiProfile\", namePlural: \"aiProfiles\", labelSingular: \"AI Profile\", labelPlural: \"AI Profiles\", icon: \"IconBrain\", description: \"AI-generated profile summary for a person\" } }) { id } }"}' \
    | jq -r '.data.createOneObject.id')
  echo "Created: $AP_ID"
fi

for field_json in \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$AP_ID"'\", name: \"profileSummary\", label: \"Profile Summary\", type: TEXT, icon: \"IconFileText\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$AP_ID"'\", name: \"lastUpdated\", label: \"Last Updated\", type: DATE_TIME, icon: \"IconClock\" } }) { id name } }"}' \
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

# 3. Extend Person
echo ""
echo "--- Person (extend) ---"
PERSON_ID=$(get_object_id "person")
echo "Person ID: $PERSON_ID"

for field_json in \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$PERSON_ID"'\", name: \"listmonkUUID\", label: \"Listmonk UUID\", type: TEXT, icon: \"IconMail\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$PERSON_ID"'\", name: \"marketingConsent\", label: \"Marketing Consent\", type: BOOLEAN, icon: \"IconCheck\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$PERSON_ID"'\", name: \"whatsAppStatus\", label: \"WhatsApp Status\", type: TEXT, icon: \"IconBrandWhatsapp\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$PERSON_ID"'\", name: \"emailValid\", label: \"Email Valid\", type: BOOLEAN, icon: \"IconMailCheck\" } }) { id name } }"}' \
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

# 4. Relations
echo ""
echo "--- Relations ---"

echo "Creating: Person -> CommunicationLog..."
result=$(gql '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$PERSON_ID"'\", name: \"communicationLogs\", label: \"Communication Logs\", type: RELATION, icon: \"IconLink\", relationCreationPayload: { type: ONE_TO_MANY, targetObjectMetadataId: \"'"$CL_ID"'\", targetFieldLabel: \"Person\", targetFieldIcon: \"IconUser\" } } }) { id name } }"}')
name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
if [ -n "$name" ]; then
  echo "  Relation '$name' created"
else
  err=$(echo "$result" | jq -r '.errors[0].message // empty')
  echo "  Skipped (${err:-already exists or error})"
fi

echo "Creating: Person -> AI Profile..."
result=$(gql '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$PERSON_ID"'\", name: \"aiProfiles\", label: \"AI Profiles\", type: RELATION, icon: \"IconLink\", relationCreationPayload: { type: ONE_TO_MANY, targetObjectMetadataId: \"'"$AP_ID"'\", targetFieldLabel: \"Person\", targetFieldIcon: \"IconUser\" } } }) { id name } }"}')
name=$(echo "$result" | jq -r '.data.createOneField.name // empty')
if [ -n "$name" ]; then
  echo "  Relation '$name' created"
else
  err=$(echo "$result" | jq -r '.errors[0].message // empty')
  echo "  Skipped (${err:-already exists or error})"
fi

echo ""
echo "=== Setup complete ==="
echo "Check https://crm.tob.sh/settings/objects to verify."
