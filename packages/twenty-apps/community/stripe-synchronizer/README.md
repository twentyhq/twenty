# Stripe synchronizer

Synchronizes customers from Stripe to Twenty

## Requirements
- an `apiKey` - go to Settings > API & Webhooks to generate one
- Stripe secret API key - available in Stripe workbench

## Setup
1. Synchronize app
```bash
cd packages/twenty-apps/community/stripe-synchronizer
yarn auth
yarn sync
```
2. Go to Stripe > Workbench > Webhooks and add webhook:
- events: customer.subscription.created and customer.subscription.updated
- webhook endpoint
- destination: `{TWENTY_URL}/s/webhook/stripe`, e.g. https://workspace.twenty.com/s/webhook/stripe
3. Go to Twenty > Settings > Integrations > Stripe synchronizer > Settings and add values

## Flow
1. Retrieve Stripe webhook
2. Check if it's either subscription created or updated, if not, exit
3. Read customer ID, sub status and quantity from webhook
4. Read customer data from Stripe API, if business name is empty, exit
5. Check if customer company exists in Twenty, if not, create it
6. Check if related person exists in Twenty, if not, create it and link to company

## Notes
- app synchronizes only new customers, those created before start of app won't be synchronized unless they're updated
- customers will be added to Twenty People object only if their name and email are filled with data, otherwise app will throw an error 

## Todo
- add validation of signature key from Stripe to ensure that incoming request is valid
  (possible once request headers are exposed to serverless functions)
- update app so it'll use provided Twenty generated object with native types from workspace once extending objects is possible