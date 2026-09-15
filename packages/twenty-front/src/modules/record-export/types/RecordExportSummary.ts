import { type FindManyRecordExportsQuery } from '~/generated-metadata/graphql';

export type RecordExportSummary =
  FindManyRecordExportsQuery['findManyRecordExports'][number];
