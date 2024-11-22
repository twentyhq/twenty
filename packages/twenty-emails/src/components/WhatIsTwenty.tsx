import { Column, Row } from '@react-email/components';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { ShadowText } from 'src/components/ShadowText';
import { SubTitle } from 'src/components/SubTitle';
export const WhatIsTwenty = () => {
  return (
    <>
      <SubTitle value="What is Twenty?" />
      <MainText>
        It's a CRM, a software to help businesses manage their customer data and
        relationships efficiently.
      </MainText>
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
        Twenty.com Public Benefit Corporation
        <br />
        2261 Market Street #5275
        <br />
        San Francisco, CA 94114
      </ShadowText>
    </>
  );
};
