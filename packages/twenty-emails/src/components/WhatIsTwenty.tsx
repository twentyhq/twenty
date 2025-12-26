import { type I18n } from '@lingui/core';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';

type WhatIsTwentyProps = {
  i18n: I18n;
};

// Renamed for Controlit branding but keeping export name for compatibility
export const WhatIsTwenty = ({ i18n }: WhatIsTwentyProps) => {
  return (
    <>
      <SubTitle value={i18n._('What is Controlit CRM?')} />
      <MainText>
        {i18n._(
          "It's a CRM system for Controlit Factory - helping manage customer relationships and business data efficiently.",
        )}
      </MainText>
    </>
  );
};
