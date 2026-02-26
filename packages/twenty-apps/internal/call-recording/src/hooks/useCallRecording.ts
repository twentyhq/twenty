import { useEffect, useState } from 'react';
import { useRecordId } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/generated';
import { isDefined } from 'twenty-shared/utils';

type CallRecording = {
  id: string;
  name: string;
  createdAt: string;
  endedAt: string | null;
  recordingFile: Array<{ fileId: string; label: string; url: string | null; extension: string | null }>;
  transcriptFile: Array<{ fileId: string; label: string; url: string | null; extension: string | null }>;
  transcript: { markdown: string | null } | null;
  summary: { markdown: string | null } | null;
};

export const useCallRecording = () => {
  const recordId = useRecordId();

  const [callRecording, setCallRecording] = useState<CallRecording | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isDefined(recordId)) {
      setError(new Error('Record ID is not defined'));

      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = new CoreApiClient();

        const { callRecording } = await client.query({
          callRecording: {
            __args: {
              filter: { id: { eq: recordId } },
            },
            id: true,
            name: true,
            createdAt: true,
            endedAt: true,
            recordingFile: {
              fileId: true,
              label: true,
              url: true,
              extension: true,
            },
            transcriptFile: {
              fileId: true,
              label: true,
              url: true,
              extension: true,
            },
            transcript: {
              markdown: true,
            },
            summary: {
              markdown: true,
            },
          },
        });

        setCallRecording({
          id: callRecording?.id ?? '',
          name: callRecording?.name ?? '',
          createdAt: callRecording?.createdAt ?? '',
          endedAt: callRecording?.endedAt ?? null,
          recordingFile: callRecording?.recordingFile?.map((file) => ({
            fileId: file.fileId,
            label: file.label,
            url: file.url ?? null,
            extension: file.extension ?? null,
          })) ?? [],
          transcriptFile: callRecording?.transcriptFile?.map((file) => ({
            fileId: file.fileId,
            label: file.label,
            url: file.url ?? null,
            extension: file.extension ?? null,
          })) ?? [],
          transcript: callRecording?.transcript
            ? { markdown: callRecording.transcript.markdown ?? null }
            : null,
          summary: callRecording?.summary
            ? { markdown: callRecording.summary.markdown ?? null }
            : null,
        });
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          setError(fetchError);
        } else {
          setError(new Error('Failed to fetch call recording'));
        }
      }

      setLoading(false);
    };

    fetchRecord();

    return () => {
      setCallRecording(null);
      setLoading(false);
      setError(null);
    };
  }, [recordId]);

  return { callRecording, loading, error };
};
