import { isUndefined } from '@sniptt/guards';

export const isRecallBotBookedJoinAtCurrent = ({
  bookedJoinAt,
  currentJoinAt,
}: {
  bookedJoinAt: string | undefined;
  currentJoinAt: string;
}): boolean =>
  !isUndefined(bookedJoinAt) &&
  new Date(bookedJoinAt).getTime() === new Date(currentJoinAt).getTime();
