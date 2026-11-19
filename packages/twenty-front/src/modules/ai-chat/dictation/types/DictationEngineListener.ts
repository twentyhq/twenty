import { type DictationEngineEvent } from '@/ai-chat/dictation/types/DictationEngineEvent';

export type DictationEngineListener = (event: DictationEngineEvent) => void;
