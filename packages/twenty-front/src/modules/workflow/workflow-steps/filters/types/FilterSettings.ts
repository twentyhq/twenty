import {
  type StepFilter,
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from 'twenty-shared/types';

export type FilterSettings = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
};

export type FilterSettingsWithPotentiallyDeprecatedOperand = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
};
