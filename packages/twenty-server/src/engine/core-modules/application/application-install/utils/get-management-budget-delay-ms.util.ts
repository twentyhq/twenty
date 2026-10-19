import { type LogicFunctionManagementBudgetReservation } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

export const getManagementBudgetDelayMs = ({
  reservation,
  functionIndex,
}: {
  reservation: LogicFunctionManagementBudgetReservation;
  functionIndex: number;
}): number =>
  Math.max(
    0,
    reservation.startsAt +
      functionIndex * reservation.functionIntervalMs -
      Date.now(),
  );
