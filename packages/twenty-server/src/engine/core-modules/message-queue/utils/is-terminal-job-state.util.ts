import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';

export const isTerminalJobState = (state: JobStateEnum): boolean =>
  state === JobStateEnum.COMPLETED || state === JobStateEnum.FAILED;
