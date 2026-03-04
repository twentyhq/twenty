const express = require('express');
const axios = require('axios');
const { z } = require('zod');
const app = express();

require('dotenv').config();

// API configuration for Recall.ai
const RECALLAI_API_URL = process.env.RECALLAI_API_URL || 'https://api.recall.ai';
const RECALLAI_API_KEY = process.env.RECALLAI_API_KEY;

app.get('/start-recording', async (req, res) => {
    console.log('Creating upload token with configured Recall.ai API key');

    if (!RECALLAI_API_KEY) {
        console.error("RECALLAI_API_KEY is missing! Set it in .env file");
        return res.json({ status: 'error', message: 'RECALLAI_API_KEY is missing' });
    }

    const url = `${RECALLAI_API_URL}/api/v1/sdk_upload/`;

    try {
        const response = await axios.post(url, {
            recording_config: {
                transcript: {
                    provider: {
                        assembly_ai_v3_streaming: {}
                    }
                },
                realtime_endpoints: [
                    {
                        type: "desktop_sdk_callback",
                        events: [
                            "participant_events.join",
                            "video_separate_png.data",
                            "transcript.data",
                            "transcript.provider_data"
                        ]
                    },
                ],
            }
        }, {
            headers: { 'Authorization': `Token ${RECALLAI_API_KEY}` },
            timeout: 9000,
        });

        res.json({
            status: 'success',
            upload_token: response.data.upload_token,
            upload_id: response.data.id,
            recording_id: response.data.recording_id,
        });
    } catch (e) {
        console.error("Error creating upload token:", JSON.stringify(e.errors || e.response?.data || e.message));
        res.json({ status: 'error', message: e.message });
    }
});

app.get('/recording/:recordingId', async (req, res) => {
    const parseResult = z.string().uuid().safeParse(req.params.recordingId);

    if (!RECALLAI_API_KEY) {
        return res.json({ status: 'error', message: 'RECALLAI_API_KEY is missing' });
    }

    if (!parseResult.success) {
        return res.status(400).json({ status: 'error', message: 'Invalid recording ID' });
    }

    const validatedRecordingId = parseResult.data;

    try {
        const response = await axios.get(
            `${RECALLAI_API_URL}/api/v1/recording/${validatedRecordingId}/`,
            {
                headers: { 'Authorization': `Token ${RECALLAI_API_KEY}` },
                timeout: 10000,
            }
        );

        const data = response.data;
        const videoUrl = data.media_shortcuts?.video_mixed?.data?.download_url || null;
        const transcriptUrl = data.media_shortcuts?.transcript?.data?.download_url || null;
        const statusCode = data.status?.code || 'unknown';

        res.json({
            status: 'success',
            recording_status: statusCode,
            video_url: videoUrl,
            transcript_url: transcriptUrl,
        });
    } catch (e) {
        console.error("Error fetching recording:", JSON.stringify(e.response?.data || e.message));
        res.json({ status: 'error', message: e.response?.data || e.message });
    }
});

if (require.main === module) {
    app.listen(13373, () => {
        console.log(`Server listening on http://localhost:13373`);
    });
}

module.exports = app;
