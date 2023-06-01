import { execShell } from '../src/config';

export {};

test('execShell runs a shell command', async () => {
  let response = await execShell('echo "hello"');
  expect(response).toEqual('hello\n');
});