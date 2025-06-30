import { createState } from 'twenty-ui/utilities';

type SelectIsInModalState = {
  isInModal: boolean;
};

export const selectIsInModalState = createState<SelectIsInModalState>({
  key: 'iconPickerState',
  defaultValue: { isInModal: false },
});
