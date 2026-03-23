#!/bin/bash
set -euo pipefail

# Add missing fields to TOB Subscriptions object
# Follows the same pattern as setup-data-model.sh
# Idempotent: skips fields that already exist

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

echo "=== Add Subscription Fields ==="

# Find TOB Subscriptions object
echo ""
echo "--- TOB Subscriptions ---"
SUB_ID=$(get_object_id "tobSubscription")
if [ -z "$SUB_ID" ]; then
  echo "ERROR: TOB Subscriptions object not found. Make sure Pablo has created it."
  exit 1
fi
echo "Found: $SUB_ID"

# Add missing fields
for field_json in \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"paymentStatus\", label: \"Payment Status\", type: SELECT, icon: \"IconCreditCard\", options: [{value: \"PAID\", label: \"Paid\", color: \"green\", position: 0}, {value: \"INSTALLMENTS\", label: \"Installments\", color: \"blue\", position: 1}, {value: \"OVERDUE\", label: \"Overdue\", color: \"red\", position: 2}, {value: \"IN_DISPUTE\", label: \"In Dispute\", color: \"orange\", position: 3}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"accessStatus\", label: \"Access Status\", type: SELECT, icon: \"IconShieldCheck\", options: [{value: \"ACTIVE\", label: \"Active\", color: \"green\", position: 0}, {value: \"NOT_GRANTED\", label: \"Not Granted\", color: \"gray\", position: 1}, {value: \"PAUSED\", label: \"Paused\", color: \"yellow\", position: 2}, {value: \"WITHDRAWN\", label: \"Withdrawn\", color: \"red\", position: 3}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"subscriptionType\", label: \"Subscription Type\", type: SELECT, icon: \"IconCategory\", options: [{value: \"COACHING\", label: \"Coaching\", color: \"blue\", position: 0}, {value: \"TRAINING\", label: \"Training\", color: \"green\", position: 1}, {value: \"CERTIFICATION\", label: \"Certification\", color: \"purple\", position: 2}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"offerDiscountTag\", label: \"Offer/Discount Tag\", type: TEXT, icon: \"IconTag\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"lastTouchpoint\", label: \"Last Touchpoint\", type: DATE_TIME, icon: \"IconClock\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"nextActionDueDate\", label: \"Next Action / Due Date\", type: DATE_TIME, icon: \"IconCalendarEvent\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"pauseDays\", label: \"Pause Days\", type: NUMBER, icon: \"IconClock\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"finalEndDate\", label: \"Final End Date\", type: DATE_TIME, icon: \"IconCalendarCheck\" } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"subscriptionStatus\", label: \"Subscription Status\", type: SELECT, icon: \"IconCircle\", options: [{value: \"ACTIVE\", label: \"Active\", color: \"green\", position: 0}, {value: \"INACTIVE\", label: \"Inactive\", color: \"red\", position: 1}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"inactiveReason\", label: \"Inactive Reason\", type: SELECT, icon: \"IconAlertCircle\", options: [{value: \"PAUSE\", label: \"Pause\", color: \"yellow\", position: 0}, {value: \"CANCELLATION_CUSTOMER\", label: \"Cancellation – Customer\", color: \"red\", position: 1}, {value: \"CANCELLATION_TOB\", label: \"Cancellation – TOB\", color: \"red\", position: 2}, {value: \"REVERSAL\", label: \"Reversal\", color: \"orange\", position: 3}, {value: \"CONTRACT_EXPIRY\", label: \"Contract Expiry\", color: \"gray\", position: 4}] } }) { id name } }"}' \
  '{"query": "mutation { createOneField(input: { field: { objectMetadataId: \"'"$SUB_ID"'\", name: \"historicalPauseDays\", label: \"Historical Pause Days\", type: NUMBER, icon: \"IconHistory\" } }) { id name } }"}' \
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

# Update accessStatus to include UNCLEAR option
echo ""
echo "--- Updating Access Status options ---"
FIELD_QUERY='{"query": "{ objects(paging: {first: 100}) { edges { node { id nameSingular fields(paging: {first: 100}) { edges { node { id name } } } } } } }"}'
FIELD_ID=$(gql "$FIELD_QUERY" \
  | jq -r '.data.objects.edges[].node | select(.nameSingular == "tobSubscription") | .fields.edges[].node | select(.name == "accessStatus") | .id')

if [ -z "$FIELD_ID" ]; then
  echo "  accessStatus field not found — skipping"
else
  echo "  Found accessStatus field: $FIELD_ID"
  UPDATE_QUERY='{"query": "mutation { updateOneField(idToUpdate: \"'"$FIELD_ID"'\", updatePayload: { options: [{value: \"ACTIVE\", label: \"Active\", color: \"green\", position: 0}, {value: \"NOT_GRANTED\", label: \"Not Granted\", color: \"gray\", position: 1}, {value: \"PAUSED\", label: \"Paused\", color: \"yellow\", position: 2}, {value: \"WITHDRAWN\", label: \"Withdrawn\", color: \"red\", position: 3}, {value: \"UNCLEAR\", label: \"Unclear\", color: \"orange\", position: 4}] }) { id name } }"}'
  result=$(gql "$UPDATE_QUERY")
  name=$(echo "$result" | jq -r '.data.updateOneField.name // empty')
  if [ -n "$name" ]; then
    echo "  Updated '$name' with UNCLEAR option"
  else
    err=$(echo "$result" | jq -r '.errors[0].message // empty')
    echo "  Failed (${err:-unknown error})"
  fi
fi

echo ""
echo "=== Done ==="
echo "Check Settings > Data Model > TOB Subscriptions to verify."
