import { gql } from '@apollo/client';

export const GET_ALL_PABX = gql`
  query getAllExtensions {
    getAllExtensions {
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
    }
  }
`;
