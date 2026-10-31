import { type RefObject, useEffect } from 'react';

type SettingsDataModelFieldSelectFormOptionDescriptionFocusEffectProps = {
  inputRef: RefObject<HTMLInputElement | null>;
};

export const SettingsDataModelFieldSelectFormOptionDescriptionFocusEffect = ({
  inputRef,
}: SettingsDataModelFieldSelectFormOptionDescriptionFocusEffectProps) => {
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return null;
};
