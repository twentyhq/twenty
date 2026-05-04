import { v4 as uuidv4 } from 'uuid';

const BASE_UUID = '8f3b2121-f194-4ba4-9fbf-';

export const setupUuidV4Mock = () => {
  let counter = 0;

  beforeEach(() => {
    counter = 0;
    (uuidv4 as jest.Mock).mockImplementation(() => `${BASE_UUID}${counter++}`);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
};
