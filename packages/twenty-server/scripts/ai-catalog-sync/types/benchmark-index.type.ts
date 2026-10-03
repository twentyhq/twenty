import { type BenchmarkRecord } from './benchmark-record.type';

// Keyed by normalized model name, so one lookup resolves every alias of a model
export type BenchmarkIndex = Map<string, BenchmarkRecord>;
