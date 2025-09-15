import { atom } from 'recoil';

export const recordCalendarSelectedDateState = atom<Date>({
  key: 'recordCalendarSelectedDateState',
  default: new Date(),
});
