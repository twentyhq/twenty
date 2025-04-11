import { createURLParamState } from '~/modules/ui/utilities/state/utils/createURLParamState';

export const animateModalURLParamState = createURLParamState<boolean>({
  key: 'animateModalURLParamState',
  paramName: 'animateModal',
  defaultValue: true,
  parseValue: (value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  },
  stringifyValue: (value) => (value ? 'true' : 'false'),
});
