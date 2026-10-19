import { type PrebuiltBundleInstallReservation } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

export const getPrebuiltBundleInstallDelayMs = ({
  reservation,
  installIndex,
}: {
  reservation: PrebuiltBundleInstallReservation;
  installIndex: number;
}): number =>
  Math.max(
    0,
    reservation.startsAt +
      installIndex * reservation.installIntervalMs -
      Date.now(),
  );
