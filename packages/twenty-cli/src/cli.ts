#!/usr/bin/env node
import { startCli } from '@/start-cli';

const exitWhenStdoutCloses = (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') {
    throw error;
  }

  process.exit();
};

process.stdout.on('error', exitWhenStdoutCloses);

void startCli({
  args: process.argv.slice(2),
  nodeVersion: process.versions.node,
  loadCli: () => import('@/run-cli'),
});
