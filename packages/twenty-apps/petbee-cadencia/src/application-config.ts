import { defineApplication } from 'twenty-sdk/define';

import {
  ALERT_WEBHOOK_VARIABLE_UNIVERSAL_IDENTIFIER,
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DRY_RUN_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    // "true" = modo sombra: calcula e loga o plano, mas não escreve nada.
    // Trocar para "false" só quando o motor n8n for desligado — nunca os dois escrevendo.
    CADENCIA_DRY_RUN: {
      universalIdentifier: DRY_RUN_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Modo sombra: "true" calcula e loga o plano sem escrever; "false" executa as operações no CRM.',
      value: 'true',
      isSecret: false,
    },
    // Segredo não carrega valor no código: preencher em Settings → Applications
    // → Cadência Petbee depois de instalar. Vazio = sem aviso de falha.
    CADENCIA_ALERT_WEBHOOK_URL: {
      universalIdentifier: ALERT_WEBHOOK_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Webhook (ex.: Slack) que recebe um aviso quando a reconciliação falha. Vazio = sem aviso.',
      isSecret: true,
    },
  },
});
