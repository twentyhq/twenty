import { useMutation } from '@apollo/client/react';

import { TEST_INGESTION_PIPELINE } from '@/settings/ingestion-pipeline/graphql/ingestion-pipeline.mutations';

type TestIngestionPipelineResult = {
  success: boolean;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  previewRecords: Record<string, unknown>[] | null;
  errors: Record<string, unknown>[] | null;
};

export const useIngestionPipelineTest = () => {
  const [testMutation, { loading }] = useMutation<{
    testIngestionPipeline: TestIngestionPipelineResult;
  }>(TEST_INGESTION_PIPELINE);

  const testPipeline = async (
    pipelineId: string,
    sampleRecords: Record<string, unknown>[],
  ): Promise<TestIngestionPipelineResult> => {
    const result = await testMutation({
      variables: { input: { pipelineId, sampleRecords } },
    });

    return result.data!.testIngestionPipeline;
  };

  return {
    testPipeline,
    isTestRunning: loading,
  };
};
