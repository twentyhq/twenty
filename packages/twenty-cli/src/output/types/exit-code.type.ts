import { type EXIT_CODE } from '@/output/constants/exit-code.constant';

export type ExitCode = (typeof EXIT_CODE)[keyof typeof EXIT_CODE];
