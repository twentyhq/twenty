export type ListFirefliesTranscriptIdsResult =
  | {
      ok: true;
      transcriptIds: string[];
    }
  | {
      ok: false;
      status: number;
      errorMessage: string;
    };
