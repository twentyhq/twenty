import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldEmptyScopedState } from '../states/isFieldEmptyScopedState';

export const useIsFieldEmpty = () => {
  // TODO : use an else if blob to check emptyness for each meta type

  const { recoilScopeId } = useContext(FieldContext);

  const [isFieldEmpty] = useRecoilState(isFieldEmptyScopedState(recoilScopeId));

  return isFieldEmpty;
};
