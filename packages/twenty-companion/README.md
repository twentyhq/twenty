# Twenty Desktop

> **WARNING: This application is a Proof of Concept (POC) and must NOT be used in production.** It is intended for demonstration and experimentation purposes only. Security, stability, and performance have not been validated for production use.

This is a demo application that shows off what you can build with the [Recall.ai Desktop Recording SDK.](https://www.recall.ai/product/desktop-recording-sdk)

This repo is intended to be a mockup of the kind of experience you can build using the Desktop Recording SDK.

Need help? Reach out to our support team [support@recall.ai](mailto:support@recall.ai).

# Setup

- Copy the `env.example` file to a `.env` file:
    - `cp .env.example .env`

- Replace `RECALLAI_API_URL` with the base URL for the [Recall region](https://docs.recall.ai/docs/regions#/) that you're using that matches your API key, example:
    - `RECALLAI_API_URL=https://us-east-1.recall.ai`

- Modify `.env` to include your Recall.ai API key:
    - `RECALLAI_API_KEY=<your key>`

Required: This project also uses live transcription with Assembly AI. You'll need to configure your own Assembly credentials on the Recall.ai dashboard. Follow our [AssemblyAI real-time transcription guide](https://docs.recall.ai/docs/dsdk-realtime-transcription#assemblyai-transcription-setup) to set this up.

If you want to enable the AI summary after a recording is finished, you can specify an OpenRouter API key.

```
OPENROUTER_KEY=<your key>
```

### Twenty CRM Integration (optional)

To automatically create `callRecording` records in Twenty when a meeting starts (and mark them as ended when the meeting closes), configure:

```
TWENTY_API_URL=http://localhost:3000
TWENTY_API_KEY=<your key>
```

The `call-recording` Twenty app must be installed in your workspace first (`packages/twenty-apps/internal/call-recording`). Generate an API key at `<your-twenty-instance>/settings/api-webhooks`.

To launch the Twenty Desktop application, start the server first, then the app:

```sh
npm ci
npm start
```

# Screenshots

![Screenshot 2025-06-16 at 10 10 57 PM](https://github.com/user-attachments/assets/9df12246-b5be-466d-958e-e09ff0b4b3cb)
![Screenshot 2025-06-16 at 10 22 44 PM](https://github.com/user-attachments/assets/685f13ab-7c02-4f29-a987-830d331c4d36)
![Screenshot 2025-06-16 at 10 14 38 PM](https://github.com/user-attachments/assets/75817823-084c-46b0-bbe8-e0195a3f9051)
