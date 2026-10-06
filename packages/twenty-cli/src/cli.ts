#!/usr/bin/env node
import { runCli } from '@/run-cli';

const exitWhenStdoutCloses = (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') {
    throw error;
  }

  process.exit();
};

process.stdout.on('error', exitWhenStdoutCloses);

void runCli(process.argv.slice(2));
