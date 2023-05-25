#!/bin/bash

DEBIAN_FRONTEND=noninteractive

cd infra/dev
make build
make up