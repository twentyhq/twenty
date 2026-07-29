// Gladia detects the spoken language automatically; the Gladia API key must be
// configured in the Recall dashboard for the active region. Swap or extend this
// value to change the post-meeting transcription provider.
// Code switching re-detects the language per utterance so mixed-language calls
// transcribe correctly; Gladia recommends pairing it with an explicit language
// allowlist, which could become a workspace-configurable variable later.
export const RECALL_ASYNC_TRANSCRIPT_PROVIDER = {
  gladia_v2_async: {
    language_config: { code_switching: true },
  },
} as const;
