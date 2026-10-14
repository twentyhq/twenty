# Готовность API Twenty для операторского UI Gelios

Дата: 14 октября 2026. Версия проверенного локального кода: `39a44f699f`.
Стенд: `http://crm-stage.lan`, remote `stage`.

После аудита начата [локальная реализация первого этапа](gelios-implementation-stage-1.ru.md): auth mapping, восстановление regular booking/cancel и API-key адаптер KateFitNotes. По последующему согласованию автора сделали необязательным; ниже сохранены исторические результаты исходного staging до выпуска изменений. Ниже зафиксированы результаты исходного staging; локальные исправления не означают, что стенд уже обновлён.

## Решение

**API пока не готов к подключению полного операторского потока.** Чтение работает, бизнес-маршруты развёрнуты, но авторизация внешнего оператора не решена. В будущем бронировании локально воспроизведены ошибки повторов, влияющие на баланс. Положительная цепочка продажи и списания, восстановление частичного сбоя и конкуренция ещё не подтверждены на staging.

Можно начать подключение read-only экранов и адаптера чтения. Включать финансовые операции и бронирования операторам до закрытия перечисленных критериев нельзя.

## Выполненные проверки

Проверки HTTP использовали только remote `stage`. Production не проверялся. Секреты читались из локального Twenty CLI config и не выводились в отчёт или консоль.

- GET `/healthz`: **200**.
- GET с `limit=1`: `/rest/people`, `/rest/studioProducts`, `/rest/studioMemberships`, `/rest/studioPayments`, `/rest/studioBookings`, `/rest/classSessions`, `/rest/membershipTransactions`, `/rest/studioPairs`, `/rest/studioEvents`: **200**. Формат: `data`, `totalCount`, `pageInfo`.
- Через `/metadata` выполнен GraphQL query `findManyLogicFunctions`: найдены **15** студийных функций с HTTP triggers, все `isAuthRequired:true`. Список workflow actions в MCP пуст; это не отсутствие HTTP функций. SDK-пример с query `logicFunctions` не подходит текущей схеме — использован реальный `findManyLogicFunctions`.
- Проверены метаданные уникальных индексов Membership/Payment/Booking/Transaction/Session. Это подтверждение зарегистрированных индексов в metadata, а не независимая проверка физических PostgreSQL constraints.
- Найденный активный пакет: `granted=8`, `reserved=0`, `consumed=0`, `available=8`; его журнал содержит один `GRANT(+8)`. Остаток этого пакета согласован с журналом. Это выборочная проверка, не сверка всей базы.
- POST предпросмотра attendance с `previewOnly:true`, завершёнными датами и существующим пакетом: с API-ключом **403**, `ACTOR_REQUIRED`. С сохранённым app access token: **500**, `Token has expired.`
- Отрицательная проверка оплаты с несуществующим UUID продукта: **404**, структурированный `PRODUCT_NOT_FOUND`. По коду обработчика отказ предшествует любым мутациям.
- POST без credentials на 12 основных business routes: **500**, строка `Missing authentication token`. Доступ без credentials не предоставлен, но HTTP-контракт ошибки неправильный.
- `yarn test:unit` в `katfit-studio`: **52 passed, 0 failed, 0 skipped**. Это тесты utility-функций, не транзакционных handlers и не staging E2E.
- `yarn typecheck` в `katfit-studio` (прямой `tsgo --noEmit -p tsconfig.json`): **passed**, без Nx cache.
- Два диагностических сценария исполнены локально на текущих handlers с fake CoreApiClient: неверный replay бронирования и повторное освобождение резерва. Сетевые мутации в этих сценариях невозможны.

Реальные клиенты, оплаты, записи и списания в рамках проверки не создавались. Preview не дошёл до чтения пакета внутри handler из-за отсутствия actor. Никаких deploy/apply и изменений бизнес-кода не выполнялось.

## Критерии готовности

| Критерий | Результат | Основание |
| --- | --- | --- |
| Сервис доступен и основные списки читаются | Пройден | Health и 9 REST endpoints: 200 |
| Студийные HTTP команды зарегистрированы на стенде | Пройден | 15 функций получены из metadata |
| Продажа возвращает структурированный отказ | Пройден частично | PRODUCT_NOT_FOUND: 404; положительный сценарий не запускался |
| Неавторизованный запрос имеет корректный статус | Не пройден | 12 маршрутов возвращают 500 вместо auth 4xx |
| Внешний оператор определяется сервером | Не пройден для текущих credentials | API-key auth не содержит userWorkspaceId; attendance: ACTOR_REQUIRED |
| Положительный preview возвращает серверные before/after | Не проверен | Нужна пользовательская авторизация Twenty |
| Создание/редактирование клиента с операторской ролью | Не проверен | Чтение с API-ключом не подтверждает create/update permissions и защиту от дублей |
| Продажа → GRANT → attendance → CONSUME → история | Не проверен | Не выполнялась мутация тестовых данных |
| Повтор не удваивает операции и сравнивает payload | Не пройден для regular booking | Локальный replay возвращает успех на изменённом payload |
| Повтор после частичного сбоя дозавершает операцию | Не пройден для regular booking | Ранний return при наличии Booking не восстанавливает RESERVE/счётчики |
| Повтор отмены не увеличивает остаток | Не пройден | Локально: два RELEASE, available 2 при granted 1, reserved −1 |
| Уникальность ключей зарегистрирована | Пройден частично | Метаданные индексов подтверждены; физические constraints и конкурентные тесты не проверены |
| Резерв и списание могут ссылаться на одну запись | Не пройден для целевого P1 | UNIQUE(booking) без WHERE ограничивает журнал одной операцией на Booking |
| Последнее посещение / последнее место под конкуренцией | Не проверен | Наличие unique index не заменяет транзакционную проверку |
| Поддержано проведение существующей обычной брони | Не пройден | Такой HTTP команды нет среди развёрнутых 15 функций |
| Ошибки соблюдают единый JSON-контракт | Не пройден | Business refusal — JSON; auth failure — 500 и строка |

## Развёрнутые команды

Все пути ниже вызываются через `/s` и используют POST:

| Функция | Путь |
| --- | --- |
| studio-confirm-package-payment | `/studio/package-payments/confirm` |
| studio-record-past-attendance | `/studio/attendance/record-past` |
| studio-create-regular-booking | `/studio/bookings/create` |
| studio-cancel-regular-booking | `/studio/bookings/cancel` |
| studio-create-pay-as-you-go-booking | `/studio/bookings/create-pay-as-you-go` |
| studio-confirm-pay-as-you-go-payment | `/studio/bookings/confirm-pay-as-you-go-payment` |
| studio-cancel-pay-as-you-go-booking | `/studio/bookings/cancel-pay-as-you-go` |
| studio-confirm-split-payment | `/studio/split-payments/confirm` |
| studio-create-split-booking | `/studio/split-bookings/create` |
| studio-record-split-attendance | `/studio/split-attendance/record` |
| studio-cancel-split-booking | `/studio/split-bookings/cancel` |
| studio-cancel-split-participant | `/studio/split-bookings/cancel-participant` |
| studio-leads | `/studio/leads` |
| studio-lead-actions | `/studio/lead-actions` |
| studio-lead-status | `/studio/lead-status` |

## Блокеры и воспроизводимые дефекты

### P0: внешний actor и auth-контракт

В `JwtAuthStrategy.validateApiKeyToken` API-ключ даёт workspace и workspaceMemberId, но не userWorkspaceId. Route trigger передаёт userWorkspaceId из проверенного auth context; attendance требует это поле до запросов к данным. Передача personId или произвольного actorId в body не решает проблему. Пользовательская session cookie в исходниках поддерживается, session token в Bearer намеренно запрещён.

Нужно выбрать серверную интеграцию с проверенной пользовательской сессией либо спроектировать доверенный service-to-operator механизм. Затем проверить preview, 403 недостаточной роли, запись recordedBy и невозможность подмены оператора. Обновление истёкшего app token само по себе не доказывает наличие пользовательского actor.

HTTP 500 на missing/expired credentials воспроизведён на staging. В локальном route controller зарегистрирован filter для RouteTriggerException, а auth service бросает AuthException; это вероятное место исправления mapping. Точная причина на развёрнутой версии требует проверки её сборки/логов. Требуемый результат: auth 4xx с JSON и понятным кодом, без ложной ошибки сервера.

### P1: повтор regular booking не проверяет payload и не восстанавливает резерв

Источник: [create-regular-booking-handler.ts](../packages/twenty-apps/internal/katfit-studio/src/logic-functions/handlers/create-regular-booking-handler.ts).

Handler ищет запись по externalId, выбирая только её id. Если запись существует, сразу возвращает `success:true, duplicate:true`. При этом не проверяются клиент, пакет и слот и не читается наличие RESERVE. Локально переданы другой клиент/пакет/слот с существующим ключом: получен успех, число мутаций — 0.

Это также воспроизводит ветку частичного сбоя: если первая попытка успела создать Booking и прервалась перед созданием RESERVE, повтор не дозавершает резерв и счётчики. Требуется сравнение payload и идемпотентное восстановление всех этапов.

### P1: отмена с новым ключом повторно освобождает резерв

Источник: [cancel-regular-booking-handler.ts](../packages/twenty-apps/internal/katfit-studio/src/logic-functions/handlers/cancel-regular-booking-handler.ts).

Handler разрешает повтор на статусе CANCELLED_BY_STUDIO и ищет RELEASE по ключу запроса, а не по самой записи. Новый ключ создаёт дополнительный RELEASE. Локальный сценарий: GRANT(+1), RESERVE(−1), первая отмена → available 1; вторая отмена той же записи с новым ключом → available 2, reserved −1. Обе команды возвращают success. RELEASE не связан с booking, поэтому уникальный индекс booking эту ошибку не блокирует.

Также текущая команда всегда выставляет CANCELLED_BY_STUDIO и не пересчитывает bookedCount занятия. Её нельзя считать полной реализацией клиентской своевременной/поздней отмены только по наличию endpoint. Нужны явные правила отмены, защита одной отмены записи и согласованность вместимости.

### P1: индекс журнала несовместим с будущим RESERVE → CONSUME

Источник: [transaction-booking.index.ts](../packages/twenty-apps/internal/katfit-studio/src/indexes/transaction-booking.index.ts).

На staging зарегистрирован UNIQUE(booking), `indexWhereClause=null`. Будущая запись уже создаёт RESERVE с bookingId. Второй CONSUME с тем же bookingId нарушит эту уникальность. Для прямого внесения прошлого занятия, где существует только CONSUME, это не препятствие; для проведения ранее зарезервированной записи — препятствие. Пересмотреть ограничение так, чтобы защищалось единственное списание, а не единственная операция всех типов на запись. Затем проверить физический индекс и миграционный план.

### Неподтверждённая атомарность

Payment/Attendance handlers используют последовательные мутации SDK. Уникальные ключи и consumptionSequence зарегистрированы, но общая транзакция не обеспечена. Сбои после создания Booking/CONSUME и до пересчёта кэша требуют проверенного восстановления. 52 utility-теста не покрывают этот критерий.

## Что делать следующим

1. Закрыть пользовательскую авторизацию и mapping auth ошибок; выполнить успешный preview без записи.
2. На выделенных staging fixtures проверить клиент create/update, продажу пакета, два идентичных повтора, конфликт payload и списание с корректным recordedBy. Это отдельный этап с тестовыми мутациями, не выполненный в этом аудите.
3. Проверить частичные отказы P0 и два одновременных списания последнего посещения; сверить журнал, кэш и отсутствие лишних записей. После этого можно выпускать P0.
4. До включения будущего расписания исправить regular replay/cancel, индекс booking и реализовать команду проведения обычной брони. Покрыть handlers тестами восстановления и конкуренции.
5. Проверить роль реального оператора: доступ только к нужным объектам, запрет обхода финансовых команд прямым CRUD журнала и счётчиков. Нынешние проверки с доступным серверным API-ключом этого не доказывают; его ограничения роли отдельно не проверены.

Основной план: [Интеграция UI Gelios](gelios-operator-ui-integration-plan.ru.md).
