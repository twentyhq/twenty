import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldEmptyScopedState } from '../states/isFieldEmptyScopedState';

export const useIsFieldEmpty = () => {
  const { recoilScopeId } = useContext(FieldContext);

  const [isFieldEmpty] = useRecoilState(isFieldEmptyScopedState(recoilScopeId));

  return isFieldEmpty;
};
