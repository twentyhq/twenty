import { i18n } from '@lingui/core';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';

export const WhatIsTwenty = () => {
  return (
    <>
      <SubTitle value={i18n._('What is InsurOS?')} />
      <MainText>
        {i18n._(
          "InsurOS is a CRM designed for the insurance industry to manage customer data, policies, and communications more efficiently",
        )}
      </MainText>
    </>
  );
};
