import { useLingui } from '@lingui/react';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';

export const WhatIsTwenty = () => {
  const { i18n } = useLingui();
  return (
    <>
      <SubTitle value={i18n._('What is Twenty?')} />
      <MainText>
        {i18n._(
          "It's a CRM, a software to help businesses manage their customer data and relationships efficiently.",
        )}
      </MainText>
    </>
  );
};
