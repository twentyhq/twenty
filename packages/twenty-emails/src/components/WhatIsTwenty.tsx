import { Column, Row } from '@react-email/components';

import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { ShadowText } from 'src/components/ShadowText';
import { SubTitle } from 'src/components/SubTitle';

export const WhatIsTwenty = () => {
  return (
    <>
      <SubTitle value="What is Twenty?" />
      <MainText>Twenty is a user friendly open source CRM.</MainText>
      <Row>
        <Column>
          <ShadowText>
            <Link href="https://twenty.com/" value="Website" />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link href="https://github.com/twentyhq/twenty" value="Github" />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link href="https://twenty.com/user-guide" value="User guide" />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link href="https://docs.twenty.com/" value="Developers" />
          </ShadowText>
        </Column>
      </Row>
      <ShadowText>
        Twenty PBC, 415 Mission Street
        <br />
        San Francisco, CA 94105
      </ShadowText>
    </>
  );
};
