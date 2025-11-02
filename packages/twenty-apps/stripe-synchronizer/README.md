# Stripe synchronizer

Synchronizes customers from Stripe to Twenty

## Requirements
- twenty-cli `npm install -g twenty-cli`
- an `apiKey`. Go to `https://twenty.com/settings/api-webhooks` to generate one
- 

## Setup
1. Synchronize app
```bash
twenty auth login
cd stripe-synchronizer
twenty app sync
```
2. Go to Settings > Integrations > Stripe synchronizer > Settings and add values

## Flow
1. Retrieve webhook
2. Check if it's either subscription created or updated
3. Read customer ID, sub status and quantity
4. Read customer data
5. Check if customer company exists in Twenty, if not, create it
6. Check if related person exists in Twenty, if not, create it and link to company

## Todo
- add validation of signature key from Stripe to ensure that incoming request is valid