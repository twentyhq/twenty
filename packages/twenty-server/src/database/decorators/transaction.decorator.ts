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

      console.log('1');
      const queryRunner = connectionSource.createQueryRunner();

      console.log('2');
      await queryRunner.connect();
      console.log('3');
      await queryRunner.startTransaction();

      try {
        console.log('4');
        // Inject EntityManager into method's arguments
        const result = await originalMethod?.apply(this, [
          ...args,
          queryRunner.manager,
        ]);

        console.log('5');
        await queryRunner.commitTransaction();

        console.log('6');

        return result;
      } catch (error) {
        console.log('ERROR: ', error);

        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        console.log('FINISHED !');
        await queryRunner.release();
      }
    };
  };
};
