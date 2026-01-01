# Mailchimp synchronizer

Synchronizing contacts between Twenty and Mailchimp

## Requirements
- Mailchimp API key - Mailchimp > avatar in top right corner > Profile > Extras > API keys

## Setup
1. Add app to your workspace
```bash
cd packages/twenty-apps/community/mailchimp-synchronizer
yarn auth
yarn generate
yarn sync
```
2. Go to Settings > Integrations > Mailchimp synchronizer > Settings and add required variables

## Flow
- Check if required variables are set, if not, exit
- Validate data based on set constraints, if data doesn't match constraints, exit
- Check if person already exists in Mailchimp:
  - if yes, check if UPDATE_PERSON is set to true
    - if UPDATE_PERSON is true, check if Twenty record is the same as Mailchimp record
      - if they're the same, exit
      - if not, update
    - if UPDATE_PERSON is false, exit
  - if person doesn't exist in Mailchimp, send a request to Mailchimp with new contact

## Note
- SMS support is experimental and may cause errors
- constraints are directly responsible for sent data so if e.g. you want to have a company name in 
Mailchimp, you have to set IS_COMPANY_CONSTRAINT to true