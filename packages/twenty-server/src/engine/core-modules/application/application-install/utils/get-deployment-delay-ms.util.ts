import { type LogicFunctionDeploymentReservation } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

export const getDeploymentDelayMs = ({
  reservation,
  deploymentIndex,
}: {
  reservation: LogicFunctionDeploymentReservation;
  deploymentIndex: number;
}): number =>
  Math.max(
    0,
    reservation.startsAt +
      deploymentIndex * reservation.deploymentIntervalMs -
      Date.now(),
  );
