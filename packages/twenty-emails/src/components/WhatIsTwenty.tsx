import { Column, Row } from '@react-email/components';

import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { ShadowText } from 'src/components/ShadowText';
import { SubTitle } from 'src/components/SubTitle';

export const WhatIsTwenty = () => {
  return (
    <>
      <SubTitle value="O que é o CRM - Digito Service?" />
      <MainText>
        Um software para ajudar as empresas a gerenciar seus dados e
        relacionamentos com os clientes de forma eficiente.
      </MainText>
      <Row>
        <Column>
          <ShadowText>
            <Link href="https://digitoservice.com/" value="Website" />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link href="https://digitoservice.com/docs/user-guide/" value="Guia do usuário" />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link href="https://digitoservice.com/docs/developers/" value="Desenvolvedores" />
          </ShadowText>
        </Column>
      </Row>
      <ShadowText>
        Digito Service Tecnologia
        <br />
        Tubarão, SC - Brasil
      </ShadowText>
    </>
  );
};
