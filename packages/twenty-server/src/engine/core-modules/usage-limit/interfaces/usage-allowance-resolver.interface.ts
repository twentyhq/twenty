import { type UsagePoolAvailability } from 'src/engine/core-modules/usage-limit/types/usage-pool-availability.type';

export abstract class UsageAllowanceResolver {
  abstract getPoolAvailability(
    workspaceId: string,
  ): Promise<UsagePoolAvailability>;

  abstract getAllowanceMicro(workspaceId: string): Promise<number | null>;

  abstract consumeCreditsMicro(
    workspaceId: string,
    costMicro: number,
  ): Promise<number | null>;
}
