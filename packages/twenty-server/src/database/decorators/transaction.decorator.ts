import { connectionSource } from 'src/database/typeorm/core/core.datasource';

export const Transaction = (): MethodDecorator => {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    const originalMethod = descriptor?.value;

    descriptor!.value = async function (...args: any[]) {
      await connectionSource.initialize();

      const queryRunner = connectionSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Inject EntityManager into method's arguments
        const result = await originalMethod?.apply(this, [
          ...args,
          queryRunner.manager,
        ]);

        // await queryRunner.commitTransaction();

        return result;
      } catch (error) {
        // await queryRunner.rollbackTransaction();

        throw error;
      } finally {
        await queryRunner.release();
      }
    };
  };
};
