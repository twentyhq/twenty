## How to run Twenty locally

First, install `brew` if you don’t already have it. Download here: [Homebrew](https://brew.sh/). Refer to [Install Homebrew - Mac Install Guide](https://mac.install.guide/homebrew/3) if you issues adding to your PATH setting.

Then, you can pretty much follow the [Twenty - Local Setup Guide](https://twenty.com/developers/local-setup).

Use the Whitespace forked repo: https://github.com/truewhitespace/twenty-v1. Our work is on the `baseline` branch.

For [Step 3: Set up a PostgreSQL Database](https://twenty.com/developers/local-setup#step-3:-set-up-a-postgresql-database), follow Option 1 (preferred). You may need to run these additional commands to set up a postgres user and role:

```
psql -h localhost -U postgres
createuser -s postgres
```

Outcome: You should be able to run `npx nx start` in the `twenty` root folder. This will start the frontend (http://localhost:3001/) and backend (http://localhost:3000/) services. Sign in with the default test user.

## Twenty-front
Steps to configure Twilio integration locally
1. `cd packages/twenty-front`. 
1. Update `.env` file with Twilio account sid and auth token
1. `npm run twilio-proxy` to start local proxy to serve requests to Twilio (bypass CORS issue for local)
