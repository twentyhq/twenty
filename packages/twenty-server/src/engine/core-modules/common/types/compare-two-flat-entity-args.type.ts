import { AllFlatEntities } from "src/engine/core-modules/common/types/all-flat-entities.type";
import { FromTo } from "twenty-shared/types";

export type CompareTwoFlatEntityArgs<
  TFlatEntity extends AllFlatEntities,
  PToCompare extends keyof TFlatEntity,
  PJsonB extends keyof TFlatEntity,
> = {
  propertiesToCompare: PToCompare[];
  propertiesToStringify: PJsonB[];
} & FromTo<TFlatEntity, 'flatEntity'>;
