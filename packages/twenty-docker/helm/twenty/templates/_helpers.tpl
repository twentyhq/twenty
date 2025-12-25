{{- define "twenty.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "twenty.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "twenty.namespace" -}}
{{- if .Values.namespaceOverride -}}
{{ .Values.namespaceOverride }}
{{- else -}}
{{ .Release.Namespace }}
{{- end -}}
{{- end -}}

{{/* Server image fields merged with globals */}}
{{- define "twenty.server.image" -}}
{{- $repo := default $.Values.image.repository $.Values.server.image.repository -}}
{{- $tag := default (default $.Chart.AppVersion $.Values.image.tag) $.Values.server.image.tag -}}
{{- $pp := default $.Values.image.pullPolicy $.Values.server.image.pullPolicy -}}
{{- printf "%s:%s|%s" $repo $tag $pp -}}
{{- end -}}

{{/* Worker image fields merged with globals */}}
{{- define "twenty.worker.image" -}}
{{- $repo := default $.Values.image.repository $.Values.worker.image.repository -}}
{{- $tag := default (default $.Chart.AppVersion $.Values.image.tag) $.Values.worker.image.tag -}}
{{- $pp := default $.Values.image.pullPolicy $.Values.worker.image.pullPolicy -}}
{{- printf "%s:%s|%s" $repo $tag $pp -}}
{{- end -}}

{{/* Extract parts of image helper */}}
{{- define "twenty.image.repository" -}}
{{- regexFind "^([^:|]+)" . -}}
{{- end -}}
{{- define "twenty.image.tag" -}}
{{- regexFind ":([^|]+)" . | trimPrefix ":" -}}
{{- end -}}
{{- define "twenty.image.pullPolicy" -}}
{{- regexFind "\\|(.+)$" . | trimPrefix "|" -}}
{{- end -}}

{{/* Compose DB connection URL */}}
{{- define "twenty.dbUrl" -}}
{{- if .Values.server.env.PG_DATABASE_URL -}}
{{- .Values.server.env.PG_DATABASE_URL -}}
{{- else if .Values.postgresql.enabled -}}
{{- $host := printf "%s-postgresql" (include "twenty.fullname" .) -}}
{{- $user := .Values.postgresql.auth.username | default "postgres" -}}
{{- $pass := .Values.postgresql.auth.password | default "postgres" -}}
{{- $db := .Values.postgresql.auth.database | default "twenty" -}}
{{- printf "postgres://%s:%s@%s.%s.svc.cluster.local/%s" $user $pass $host (include "twenty.namespace" .) $db -}}
{{- else if and .Values.db.enabled (not .Values.postgresql.enabled) -}}
{{- $host := printf "%s-db" (include "twenty.fullname" .) -}}
{{- $db := .Values.db.internal.database | default "twenty" -}}
{{- printf "postgres://postgres:postgres@%s.%s.svc.cluster.local/%s" $host (include "twenty.namespace" .) $db -}}
{{- else -}}
{{- $scheme := "postgres" -}}
{{- $host := .Values.db.external.host -}}
{{- $port := .Values.db.external.port | default 5432 -}}
{{- $user := .Values.db.external.user | default "postgres" -}}
{{- $pass := .Values.db.external.password | default "postgres" -}}
{{- $db := .Values.db.external.database | default "twenty" -}}
{{- $qs := ternary "?sslmode=require" "" (eq .Values.db.external.ssl true) -}}
{{- printf "%s://%s:%s@%s:%v/%s%s" $scheme $user $pass $host $port $db $qs -}}
{{- end -}}
{{- end -}}

{{/* Compose Redis URL */}}
{{- define "twenty.redisUrl" -}}
{{- if .Values.server.env.REDIS_URL -}}
{{- .Values.server.env.REDIS_URL -}}
{{- else if .Values.redis.enabled -}}
{{- $host := printf "%s-redis-master" (include "twenty.fullname" .) -}}
{{- printf "redis://%s.%s.svc.cluster.local:6379" $host (include "twenty.namespace" .) -}}
{{- else if .Values.redisInternal.enabled -}}
{{- $host := printf "%s-redis" (include "twenty.fullname" .) -}}
{{- printf "redis://%s.%s.svc.cluster.local:6379" $host (include "twenty.namespace" .) -}}
{{- else -}}
{{- $host := .Values.redis.external.host | default "redis" -}}
{{- $port := .Values.redis.external.port | default 6379 -}}
{{- printf "redis://%s:%v" $host $port -}}
{{- end -}}
{{- end -}}

{{/* Compose Server URL from ingress, else service */}}
{{- define "twenty.serverUrl" -}}
{{- if and .Values.server.ingress.enabled (gt (len .Values.server.ingress.hosts) 0) -}}
{{- $host := (index .Values.server.ingress.hosts 0).host -}}
{{- $tls := gt (len .Values.server.ingress.tls) 0 -}}
{{- $scheme := ternary "https" "http" $tls -}}
{{- $port := ternary 443 80 $tls -}}
{{- printf "%s://%s:%v" $scheme $host $port -}}
{{- else -}}
{{- $svc := printf "%s-server" (include "twenty.fullname" .) -}}
{{- $ns := include "twenty.namespace" . -}}
{{- $port := .Values.server.service.port | default 3000 -}}
{{- printf "http://%s.%s.svc.cluster.local:%v" $svc $ns $port -}}
{{- end -}}
{{- end -}}

{{/* Tokens secret name */}}
{{- define "twenty.secret.tokens.name" -}}
{{- .Values.secrets.tokens.name | default "tokens" -}}
{{- end -}}

{{/* Access token value: reuse existing secret if present, else provided value, else generated */}}
{{- define "twenty.secret.tokens.access" -}}
{{- $name := include "twenty.secret.tokens.name" . -}}
{{- $ns := include "twenty.namespace" . -}}
{{- $existing := lookup "v1" "Secret" $ns $name -}}
{{- if and $existing $existing.data.accessToken -}}
{{- b64dec $existing.data.accessToken -}}
{{- else if .Values.secrets.tokens.accessToken -}}
{{- .Values.secrets.tokens.accessToken -}}
{{- else -}}
{{- randAlphaNum 32 -}}
{{- end -}}
{{- end -}}

{{/* Server container port: prefer env NODE_PORT, else service.port, else 3000 */}}
{{- define "twenty.server.containerPort" -}}
{{- if .Values.server.env.NODE_PORT -}}
{{- .Values.server.env.NODE_PORT -}}
{{- else if .Values.server.service.port -}}
{{- .Values.server.service.port -}}
{{- else -}}
3000
{{- end -}}
{{- end -}}

{{/* Storage type: prefer top-level storage.type, else legacy server.env.STORAGE_TYPE, else local */}}
{{- define "twenty.storageType" -}}
{{- if .Values.storage.type -}}
{{- .Values.storage.type -}}
{{- else if .Values.server.env.STORAGE_TYPE -}}
{{- .Values.server.env.STORAGE_TYPE -}}
{{- else -}}
local
{{- end -}}
{{- end -}}

{{/* Additional storage env vars (e.g., S3) */}}
{{- define "twenty.storageEnv" -}}
{{- if eq (include "twenty.storageType" .) "s3" -}}
{{- with .Values.storage.s3.bucket }}
- name: S3_BUCKET
  value: {{ . | quote }}
{{- end }}
{{- with .Values.storage.s3.region }}
- name: S3_REGION
  value: {{ . | quote }}
{{- end }}
{{- with .Values.storage.s3.endpoint }}
- name: S3_ENDPOINT
  value: {{ . | quote }}
{{- end }}
{{- with .Values.storage.s3.accessKeyId }}
- name: S3_ACCESS_KEY_ID
  value: {{ . | quote }}
{{- end }}
{{- with .Values.storage.s3.secretAccessKey }}
- name: S3_SECRET_ACCESS_KEY
  value: {{ . | quote }}
{{- end }}
{{- end -}}
{{- end -}}
