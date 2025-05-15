import { gql } from '@apollo/client';

export const GET_USER_SOFTFONE = gql`
  query getUserSoftfone($extNum: String!, $workspaceId: ID!) {
    getUserSoftfone(extNum: $extNum, workspaceId: $workspaceId) {
      codigo_incorporacao
      cliente_id
      codigo_area
      nome
      numero
      plano_discagem_id
      ramal_id
      caller_id_externo
      usuario_autenticacao
      numero
      senha_sip
    }
  }
`;
