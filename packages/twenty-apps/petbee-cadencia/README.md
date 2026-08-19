# Cadência Petbee (Twenty App)

Motor da régua comercial dentro do próprio Twenty, como aplicativo nativo
(`twenty-sdk`). Porte 1:1 do workflow n8n "Cadência Twenty (nativa)" v10 —
mesma régua, mesmas guardas, mesmo algoritmo de reconciliação.

## O que ele faz

- **Régua v2 (9 toques)**: concluir a FUP N cria a FUP N+1, com prazo ancorado
  na conclusão real (manhã 9h30 / tarde 16h em São Paulo; FUP 2 = +1h30;
  conclusão da "tarde" após as 16h empurra pra amanhã).
- **Guarda pós-FUP 9**: card parado em Em Negociação com os 9 toques feitos
  ganha a task "Decidir: Break ou Perdido? — [nome]" até alguém mover o card.
- **Break**: agenda a "FUP final (antes do lost)" pra +25 dias, 11h.
- **Perdido sem motivo**: task-guarda "Preencher motivo da perda" até o motivo entrar.
- **Ganhou/Perdido/fora do funil**: tasks de régua abertas somem; manuais nunca são tocadas.
- **Autocura**: dedup de corrida, self-heal do link do WhatsApp (wa.me → inbox),
  fupNumero sincronizado, órfãs removidas. Vencimento editado à mão é respeitado.

## Arquitetura

```
src/cadencia/regua.ts      → régua pura (datas, títulos, padrões)   [testada]
src/cadencia/plan.ts       → computePlan: estado desejado → ops     [testada]
src/cadencia/reconcile.ts  → lê o CRM (CoreApiClient), executa o plano, alerta falha
src/logic-functions/
  tick.ts                    → cron */5min (rede de segurança)
  on-opportunity-created.ts  → campainha: negócio novo
  on-opportunity-updated.ts  → campainha: stage/fupNumero/motivo/whatsapp mudou
  on-task-updated.ts         → campainha: status de task mudou (done → próxima FUP)
```

Todo gatilho chama a MESMA reconciliação: ler o funil inteiro → calcular o que
deveria existir → criar/concluir/apagar a diferença. Evento dá velocidade,
cron dá verdade.

## Variáveis do app

| Variável | Padrão | Papel |
|---|---|---|
| `CADENCIA_DRY_RUN` | `"true"` | **Modo sombra**: calcula e loga o plano, não escreve nada. Só vire `"false"` com o motor n8n desligado. |
| `CADENCIA_ALERT_WEBHOOK_URL` | vazio | Webhook (Slack) avisado quando a reconciliação falha. |

## Testes

```bash
yarn test        # 21 testes do núcleo puro (datas da régua + plano)
```

## Deploy (na máquina do Lucas)

```bash
cd packages/twenty-apps/petbee-cadencia
yarn install
yarn twenty remote:add --url https://crm.petbeetools.com.br --api-key $TWENTY_API_KEY --as petbee
yarn twenty plan     # mostra o que será criado, sem aplicar
yarn twenty apply    # instala/atualiza o app no workspace
yarn twenty dev:function:logs -n cadencia-tick   # acompanhar o modo sombra
```

## Plano de adoção (sem risco)

1. **Sombra** (`CADENCIA_DRY_RUN=true`, padrão): o app roda em paralelo ao motor
   n8n e apenas LOGA o plano que executaria. Como o n8n mantém o estado
   reconciliado, o esperado no log é `totalOps: 0` em regime — qualquer op
   não-vazia persistente é divergência a investigar.
2. **Paridade provada** (alguns dias de logs limpos): desligar o motor n8n
   (despublicar o workflow "Cadência Twenty (nativa)" e apagar o webhook
   campainha do Twenty) e virar `CADENCIA_DRY_RUN=false`.
3. **Rollback**: virar `CADENCIA_DRY_RUN=true` de volta e republicar o workflow
   n8n. Os dois nunca escrevem ao mesmo tempo.

## Regra de ouro

Enquanto o n8n for o motor ativo, **qualquer mudança de régua vale nos dois**
(no jsCode do "Plano de cadência" e em `src/cadencia/`). Depois da adoção, este
app vira a única fonte da verdade.
