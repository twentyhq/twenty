import { type BenchmarkRecord } from './benchmark-record.type';

// Keyed by normalized model name, so a single lookup resolves every alias a
// source publishes for the same underlying model.
export type BenchmarkIndex = Map<string, BenchmarkRecord>;
