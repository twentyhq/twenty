import { type DictationEngineEvent } from '@/ai/dictation/types/DictationEngineEvent';

export type DictationEngineListener = (event: DictationEngineEvent) => void;
