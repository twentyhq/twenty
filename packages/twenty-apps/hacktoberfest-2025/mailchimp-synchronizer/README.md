# Mailchimp synchronizer

Synchronizing contacts between Twenty and Mailchimp

## Requirements
- twenty-cli `npm install -g twenty-cli`
- an `apiKey`. Go to `https://twenty.com/settings/api-webhooks` to generate one

## Setup
1. Add app to your workspace
```bash
twenty auth login
cd mailchimp-synchronizer
twenty app sync
```

2. Go to Settings > Integrations > Mailchimp synchronizer > Settings and add required variables

## Flow
- Check if required variables are set, if not, exit
- Validate data based on set constraints
- If all constraints are checked, send a request to Mailchimp with new contact

## Note
- SMS support is experimental and may cause errors