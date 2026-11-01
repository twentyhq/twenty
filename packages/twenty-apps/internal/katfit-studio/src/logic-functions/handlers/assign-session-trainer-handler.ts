import { isValidUuid } from 'twenty-shared/utils';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  readCompensationRecords,
  withOpenSessionCompensation,
  writeCompensationRecord,
} from 'src/logic-functions/utils/compensation-records';
import { CompensationError } from 'src/logic-functions/utils/trainer-compensation';

export type AssignSessionTrainerInput = {
  classSessionId: string;
  trainerId: string;
  requestKey: string;
};
export type AssignSessionTrainerResult =
  | { success: true; trainerId: string; duplicate: boolean }
  | { success: false; status: number; code: string; message: string };

export const assignSessionTrainer = async (
  input: AssignSessionTrainerInput,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
): Promise<AssignSessionTrainerResult> => {
  if (
    !input.classSessionId?.trim() ||
    !input.trainerId?.trim() ||
    !isValidUuid(input.requestKey)
  )
    return {
      success: false,
      status: 400,
      code: 'INVALID_TRAINER_ASSIGNMENT',
      message: 'Выберите занятие, тренера и укажите ключ операции.',
    };
  return withOpenSessionCompensation(client, input.classSessionId, async () => {
    try {
      const [sessions, trainers, events] = await Promise.all([
        readCompensationRecords<{
          id: string;
          status: string;
          completionLockedAt: string | null;
          trainer: { id: string; name: string } | null;
        }>(
          client,
          'classSessions',
          { id: { eq: input.classSessionId } },
          {
            id: true,
            status: true,
            completionLockedAt: true,
            trainer: { id: true, name: true },
          },
        ),
        readCompensationRecords<{ id: string; name: string; active: boolean }>(
          client,
          'studioTrainers',
          { id: { eq: input.trainerId } },
          { id: true, name: true, active: true },
        ),
        readCompensationRecords<{
          id: string;
          details: string;
          eventType: string;
          outcome: string;
        }>(
          client,
          'studioEvents',
          { id: { eq: input.requestKey } },
          { id: true, details: true, eventType: true, outcome: true },
        ),
      ]);
      const session = sessions[0];
      const trainer = trainers[0];
      if (!session)
        throw new CompensationError('SESSION_NOT_FOUND', 'Занятие не найдено.');
      if (!trainer?.active)
        throw new CompensationError(
          'TRAINER_NOT_ACTIVE',
          'Выберите активного тренера из каталога.',
        );
      if (
        session.completionLockedAt ||
        session.status === 'CANCELLED_BY_STUDIO'
      )
        throw new CompensationError(
          'SESSION_TRAINER_LOCKED',
          'У закрытого или отменённого занятия тренер меняется только через исправление начисления.',
        );
      if (events.length > 1)
        throw new CompensationError(
          'TRAINER_ASSIGNMENT_REQUIRES_REVIEW',
          'Журнал назначения тренера требует проверки.',
        );
      if (events[0]) {
        if (events[0].eventType !== 'TRAINER_ASSIGNED')
          throw new CompensationError(
            'IDEMPOTENCY_CONFLICT',
            'Ключ уже занят другой операцией.',
          );
        const saved = JSON.parse(events[0].details) as {
          classSessionId: string;
          trainer: { id: string };
          previousTrainer: { id: string } | null;
        };
        if (
          saved.classSessionId !== input.classSessionId ||
          saved.trainer.id !== input.trainerId
        )
          throw new CompensationError(
            'IDEMPOTENCY_CONFLICT',
            'Ключ назначения уже использован для другого занятия или тренера.',
          );
        if (events[0].outcome === 'SUCCESS') {
          if (session.trainer?.id !== trainer.id)
            throw new CompensationError(
              'STALE_TRAINER_ASSIGNMENT',
              'После этой операции тренер уже изменился. Обновите карточку.',
            );
          return {
            success: true as const,
            trainerId: trainer.id,
            duplicate: true,
          };
        }
        if (
          events[0].outcome !== 'PENDING' ||
          ((session.trainer?.id ?? null) !==
            (saved.previousTrainer?.id ?? null) &&
            session.trainer?.id !== trainer.id)
        )
          throw new CompensationError(
            'STALE_TRAINER_ASSIGNMENT',
            'Состав назначения изменился. Проверьте журнал.',
          );
        await writeCompensationRecord(
          client,
          'updateClassSession',
          { trainerId: trainer.id },
          { id: true },
          session.id,
        );
        await writeCompensationRecord(
          client,
          'updateStudioEvent',
          { outcome: 'SUCCESS' },
          { id: true },
          events[0].id,
        );
        return {
          success: true as const,
          trainerId: trainer.id,
          duplicate: true,
        };
      }
      const eventId = input.requestKey;
      // Save the old and new trainer before the update so a failed write can be resumed from the audit record.
      await writeCompensationRecord(
        client,
        'createStudioEvent',
        {
          id: eventId,
          name: 'Назначение тренера',
          eventType: 'TRAINER_ASSIGNED',
          outcome: 'PENDING',
          occurredAt: new Date().toISOString(),
          classSessionId: session.id,
          idempotencyKey: `trainer-assignment:${input.requestKey}`,
          details: JSON.stringify({
            classSessionId: session.id,
            previousTrainer: session.trainer,
            trainer,
            recordedBy: context.userWorkspaceId,
            requestKey: input.requestKey,
          }),
        },
        { id: true },
      );
      await writeCompensationRecord(
        client,
        'updateClassSession',
        { trainerId: trainer.id },
        { id: true },
        session.id,
      );
      await writeCompensationRecord(
        client,
        'updateStudioEvent',
        { outcome: 'SUCCESS' },
        { id: true },
        eventId,
      );
      return {
        success: true as const,
        trainerId: trainer.id,
        duplicate: false,
      };
    } catch (error) {
      return {
        success: false as const,
        status: error instanceof CompensationError ? 409 : 503,
        code:
          error instanceof CompensationError
            ? error.code
            : 'TRAINER_ASSIGNMENT_RETRY_REQUIRED',
        message:
          error instanceof CompensationError
            ? error.message
            : 'Назначение не подтверждено. Повторите запрос с прежним ключом.',
      };
    }
  });
};
