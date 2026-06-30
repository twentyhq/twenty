import { type CodeExecutionData } from 'twenty-shared/ai';

export type CodeExecutionStreamEmitter = (data: CodeExecutionData) => void;
