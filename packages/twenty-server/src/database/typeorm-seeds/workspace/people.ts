import { DataSource } from 'typeorm';

const tableName = 'person';

export const seedPeople = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'nameFirstName',
      'nameLastName',
      'phone',
      'city',
      'companyId',
      'email',
      'position',
    ])
    .orIgnore()
    .values([
      {
        id: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        nameFirstName: 'امیرحسام',
        nameLastName: 'کوهستانی',
        phone: '+989129012345',
        city: 'تهران',
        companyId: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
        email: 'amirhessam.kohestani@linkedin.com',
        position: 0,
      },
      {
        id: '0aa00beb-ac73-4797-824e-87a1f5aea9e0',
        nameFirstName: 'امیرمهدی',
        nameLastName: 'زند',
        phone: '+989120123456',
        city: 'کرج',
        companyId: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
        email: 'amir.zand@linkedin.com',
        position: 1,
      },
      {
        id: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
        nameFirstName: 'محمدرضا',
        nameLastName: 'کاظم زاده',
        phone: '+989389012345',
        city: 'تهران',
        companyId: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
        email: 'reza.kazem@gmail.com',
        position: 2,
      },
      {
        id: 'eeeacacf-eee1-4690-ad2c-8619e5b56a2e',
        nameFirstName: 'سینا',
        nameLastName: 'یکروی',
        phone: '+989140123456',
        city: 'تبریز',
        companyId: '118995f3-5d81-46d6-bf83-f7fd33ea6102',
        email: 'sina.yek@gmail.com',
        position: 3,
      },
      {
        id: '9b324a88-6784-4449-afdf-dc62cb8702f2',
        nameFirstName: 'علی',
        nameLastName: 'لطفی',
        phone: '+989131234567',
        city: 'قم',
        companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        email: 'ali.lotfo@microsoft.com',
        position: 4,
      },
      {
        id: '1d151852-490f-4466-8391-733cfd66a0c8',
        nameFirstName: 'علی',
        nameLastName: 'محمدزاده',
        phone: '+989362345678',
        city: 'اصفهان',
        companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        email: 'ali.mohammad@microsoft.com',
        position: 5,
      },
      {
        id: '98406e26-80f1-4dff-b570-a74942528de3',
        nameFirstName: 'محمد',
        nameLastName: 'حقیقی',
        phone: '+989163456789',
        city: 'اهواز',
        companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
        email: 'mohammad.real@microsoft.com',
        position: 6,
      },
    ])
    .execute();
};
