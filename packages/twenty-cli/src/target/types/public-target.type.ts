import { type TargetSource } from '@/target/types/target-source.type';

export type PublicTarget = {
  remote?: string;
  apiUrl: string;
  source: TargetSource;
};
